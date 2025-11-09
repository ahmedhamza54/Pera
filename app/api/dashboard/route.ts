import { NextResponse } from "next/server";
import { auth } from "@/auth";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connect";

// Define the tasks model
const tasksSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['not started', 'in progress', 'finished'], 
    default: 'not started' 
  },
  pillar: { 
    type: String, 
    enum: ['Health', 'Social', 'Mind', 'Career', 'Din'], 
    required: true 
  },
  time: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Tasks = mongoose.models.tasks || mongoose.model('tasks', tasksSchema);

interface TaskDocument {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  description: string;
  status: 'not started' | 'in progress' | 'finished';
  pillar: 'Health' | 'Social' | 'Mind' | 'Career' | 'Din';
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

const CHART_COLORS = {
  Health: "hsl(var(--chart-1))",
  Social: "hsl(var(--chart-2))",
  Mind: "hsl(var(--chart-3))",
  Career: "hsl(var(--chart-4))",
  Din: "hsl(var(--chart-5))"
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    // Get current user's tasks
    const tasks = (await Tasks.find({ userId: session.user.id })).map((task: any) => task.toObject()) as TaskDocument[];

    // Get tasks from last month for trend comparison
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthTasks = (await Tasks.find({
      userId: session.user.id,
      createdAt: { $gte: lastMonthDate }
    })).map(task => task.toObject()) as TaskDocument[];

    // Calculate scores for each pillar
    const pillars = ["Health", "Social", "Mind", "Career", "Din"];
    const pillarStats = pillars.map(pillar => {
      // Current period stats
      const pillarTasks = tasks.filter((task: TaskDocument) => task.pillar === pillar);
      const totalTasks = pillarTasks.length;
      
      let currentScore = 0;
      let trend = "up";

      if (totalTasks > 0) {
        const completedTasks = pillarTasks.filter((task: TaskDocument) => task.status === "finished").length;
        const inProgressTasks = pillarTasks.filter((task: TaskDocument) => task.status === "in progress").length;
        currentScore = Math.round(((completedTasks + (inProgressTasks * 0.5)) / totalTasks) * 100);
        
        // Last month stats for trend
        const lastMonthPillarTasks = lastMonthTasks.filter((task: TaskDocument) => task.pillar === pillar);
        const lastMonthTotal = lastMonthPillarTasks.length;
        
        if (lastMonthTotal > 0) {
          const lastMonthCompleted = lastMonthPillarTasks.filter((task: TaskDocument) => task.status === "finished").length;
          const lastMonthInProgress = lastMonthPillarTasks.filter((task: TaskDocument) => task.status === "in progress").length;
          const lastMonthScore = Math.round(((lastMonthCompleted + (lastMonthInProgress * 0.5)) / lastMonthTotal) * 100);
          trend = currentScore >= lastMonthScore ? "up" : "down";
        }
      }

      // Format for LifeBalanceWheel component
      return {
        name: pillar,
        pillar, // Add this for the RadarChart
        score: currentScore,
        trend,
        color: CHART_COLORS[pillar as keyof typeof CHART_COLORS]
      };
    });

    // Calculate weekly stats
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const weekTasks = tasks.filter((task: TaskDocument) => new Date(task.createdAt) >= lastWeekStart);
    const completedWeekTasks = weekTasks.filter((task: TaskDocument) => task.status === "finished").length;

    // Calculate active days (days with completed tasks)
    const activeDays = new Set(
      weekTasks
        .filter((task: TaskDocument) => task.status === "finished")
        .map((task: TaskDocument) => new Date(task.updatedAt).toDateString())
    ).size;

    // Calculate previous week's stats for comparison
    const prevWeekStart = new Date(lastWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekTasks = tasks.filter(
      (task: TaskDocument) => new Date(task.createdAt) >= prevWeekStart && new Date(task.createdAt) < lastWeekStart
    );
    const prevWeekCompleted = prevWeekTasks.filter((task: TaskDocument) => task.status === "finished").length;

    // Calculate trend percentages
    const tasksCompletedChange = prevWeekCompleted === 0 ? 100 : 
      Math.round(((completedWeekTasks - prevWeekCompleted) / prevWeekCompleted) * 100);
    
    const currentAvgBalance = Math.round(pillarStats.reduce((acc, p) => acc + p.score, 0) / pillarStats.length);
    const prevAvgBalance = Math.round(pillars.map(pillar => {
      const prevWeekPillarTasks = prevWeekTasks.filter((task: TaskDocument) => task.pillar === pillar);
      const total = prevWeekPillarTasks.length;
      if (total === 0) return 0;
      const completed = prevWeekPillarTasks.filter((task: TaskDocument) => task.status === "finished").length;
      const inProgress = prevWeekPillarTasks.filter((task: TaskDocument) => task.status === "in progress").length;
      return Math.round(((completed + (inProgress * 0.5)) / total) * 100);
    }).reduce((acc, score) => acc + score, 0) / pillars.length);

    const avgBalanceChange = prevAvgBalance === 0 ? 100 :
      Math.round(((currentAvgBalance - prevAvgBalance) / prevAvgBalance) * 100);

    const weeklyStats = [
      { 
        label: "Tasks Completed", 
        value: completedWeekTasks.toString(),
        change: `${tasksCompletedChange > 0 ? '+' : ''}${tasksCompletedChange}%`
      },
      { 
        label: "Avg. Balance", 
        value: currentAvgBalance + "%",
        change: `${avgBalanceChange > 0 ? '+' : ''}${avgBalanceChange}%`
      },
      { 
        label: "Active Days", 
        value: `${activeDays}/7`,
        change: "0%" // Could calculate this if needed
      }
    ];

    return NextResponse.json({
      pillarStats,
      weeklyStats
    });

  } catch (error) {
    console.error("Dashboard data error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}