import { Loader2 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
