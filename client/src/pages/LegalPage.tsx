import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Legal Agreements
          </h1>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <Card id="privacy">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">
              We collect only the information needed to operate this website
              and provide requested services. Newsletter emails are stored with
              encryption at rest, and access is limited to authorized
              administrators.
            </p>
            <p className="text-sm text-muted-foreground">
              We do not sell personal data. We may process basic usage metadata
              for security, analytics, and service improvement purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              You can request correction or removal of your data by contacting
              the site administrator.
            </p>
          </CardContent>
        </Card>

        <Card id="terms">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Terms of Service</h2>
            <p className="text-sm text-muted-foreground">
              By using this website, you agree to use it lawfully and not to
              abuse or interfere with platform operations.
            </p>
            <p className="text-sm text-muted-foreground">
              Content is provided for informational travel purposes. Availability,
              accuracy, and external links may change over time.
            </p>
            <p className="text-sm text-muted-foreground">
              The site may update these terms and privacy terms as features
              evolve, including user accounts and community contributions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
