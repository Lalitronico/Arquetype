import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function StudyNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3AED]/10">
            <AlertCircle className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <CardTitle className="text-xl">Study not found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            The study you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/studies"
            className="inline-flex items-center rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
          >
            Back to studies
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
