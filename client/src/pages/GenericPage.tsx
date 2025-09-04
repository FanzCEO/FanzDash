import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

interface GenericPageProps {
  page: {
    id: string;
    title: string;
    slug: string;
    content: string;
    description?: string;
    keywords?: string[];
    publishedAt?: string;
    updatedAt?: string;
  };
  className?: string;
}

export function GenericPage({ page, className = "" }: GenericPageProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              {page.title}
            </h1>

            {page.description && (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {page.description}
              </p>
            )}
          </div>

          {/* Page Content */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-muted/20">
            <CardContent className="p-8 lg:p-12">
              <div
                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </CardContent>
          </Card>

          {/* Meta Information */}
          {(page.publishedAt || page.updatedAt) && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {page.publishedAt && (
                <p>
                  Published: {new Date(page.publishedAt).toLocaleDateString()}
                </p>
              )}
              {page.updatedAt && page.updatedAt !== page.publishedAt && (
                <p>
                  Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Back to Top */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-testid="back-to-top-btn"
            >
              Back to Top
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericPage;
