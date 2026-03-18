import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">About Us</h1>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Visit Albania is a growing guide dedicated to showing the real
              character of the country, from mountain villages to coastal
              towns. We are building a home for practical travel planning,
              local perspectives, and genuine stories.
            </p>
            <p className="text-sm text-muted-foreground">
              This page is a placeholder for now and will be updated with a
              deeper mission statement, team story, and community guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
