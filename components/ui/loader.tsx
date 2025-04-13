import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";

interface LoaderProps {
  variant?: "simple" | "card" | "form";
  title?: string;
  message?: string;
}

export function Loader({ variant = "simple", title, message = "Loading..." }: LoaderProps) {
  switch (variant) {
    case "card":
      return (
        <div className="container flex h-screen w-full flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">{title || "Loading"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-lg">{message}</p>
            </CardContent>
          </Card>
        </div>
      );
    case "form":
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="mx-auto">
                <Skeleton className="h-8 w-32 mb-2" />
              </div>
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full mb-6" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      );
    case "simple":
    default:
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div>{message}</div>
        </div>
      );
  }
}
