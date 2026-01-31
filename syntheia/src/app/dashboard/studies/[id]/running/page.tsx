"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Users, Clock, CheckCircle2, XCircle, ArrowLeft, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProgressData {
  studyId: string;
  status: string;
  currentPersona: number;
  totalPersonas: number;
  progress: number;
  simulationStartedAt: string | null;
  completedAt: string | null;
  estimatedSecondsRemaining: number | null;
}

export default function StudyRunningPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params.id as string;

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelSimulation = async (keepPartialResults: boolean) => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/studies/${studyId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepPartialResults }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel simulation");
      }

      if (keepPartialResults) {
        // Redirect to results page with partial data
        router.push(`/dashboard/studies/${studyId}/results`);
      } else {
        // Redirect back to study list
        router.push("/dashboard/studies");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
      setIsCancelling(false);
    }
  };

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/studies/${studyId}/progress`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch progress");
      }

      setProgressData(data.data);

      // Redirect to results if completed
      if (data.data.status === "completed") {
        router.push(`/dashboard/studies/${studyId}/results`);
      }

      // Redirect back if draft (error occurred)
      if (data.data.status === "draft") {
        setError("Simulation was interrupted. Please try again.");
      }

      // Handle cancelled status
      if (data.data.status === "cancelled") {
        setError("Simulation was cancelled.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, [studyId, router]);

  // Poll for progress updates
  useEffect(() => {
    fetchProgress();

    const interval = setInterval(fetchProgress, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [fetchProgress]);

  // Update elapsed time
  useEffect(() => {
    if (!progressData?.simulationStartedAt || progressData.status !== "running") {
      return;
    }

    const startTime = new Date(progressData.simulationStartedAt).getTime();

    const updateElapsed = () => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [progressData?.simulationStartedAt, progressData?.status]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-red-200">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Simulation Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/studies">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Studies
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#7C3AED]" />
            <p className="text-gray-600">Loading simulation progress...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { currentPersona, totalPersonas, progress, estimatedSecondsRemaining } = progressData;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/dashboard/studies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studies
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#F3F0FF] flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
          </div>
          <CardTitle className="text-2xl">Running Simulation</CardTitle>
          <p className="text-gray-500 mt-1">
            Generating responses from synthetic personas
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Personas Processed</span>
              </div>
              <div className="text-2xl font-bold">
                {currentPersona} <span className="text-gray-400 text-lg font-normal">/ {totalPersonas}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Elapsed Time</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
            </div>
          </div>

          {/* Estimated Time */}
          {estimatedSecondsRemaining !== null && estimatedSecondsRemaining > 0 && (
            <div className="text-center py-3 bg-[#F3F0FF] rounded-lg">
              <p className="text-sm text-[#7C3AED]">
                Estimated time remaining: <span className="font-semibold">{formatTime(estimatedSecondsRemaining)}</span>
              </p>
            </div>
          )}

          {/* Processing indicator */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Processing persona {currentPersona + 1} of {totalPersonas}</span>
          </div>

          {/* Cancel Button */}
          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <StopCircle className="h-4 w-4 mr-2" />
                  )}
                  {isCancelling ? "Cancelling..." : "Cancel Simulation"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Simulation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {currentPersona > 0 ? (
                      <>
                        You have processed {currentPersona} of {totalPersonas} personas.
                        What would you like to do with the partial results?
                      </>
                    ) : (
                      "The simulation has just started. Do you want to cancel it?"
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel>Continue Simulation</AlertDialogCancel>
                  {currentPersona > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => cancelSimulation(true)}
                      disabled={isCancelling}
                    >
                      Keep Partial Results
                    </Button>
                  )}
                  <AlertDialogAction
                    onClick={() => cancelSimulation(false)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isCancelling}
                  >
                    Cancel & Discard
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-gray-400 pt-4">
            <p>You can leave this page - the simulation will continue running.</p>
            <p>Check the studies list for status updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
