import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  isPublished: boolean;
  publishedAt: string;
  authorId: string;
  viewCount: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/blog/posts"],
    queryFn: () =>
      fetch("/api/blog/posts").then((res) => res.json()) as Promise<BlogPost[]>,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/blog/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage blog posts and articles ({posts.length} total)
          </p>
        </div>
        <Link href="/blog/create">
          <Button data-testid="button-create-blog">
            <Plus className="mr-2 h-4 w-4" />
            Add New Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-search-blogs"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No blog posts found matching your search."
                : "No blog posts found. Create your first post to get started."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                  data-testid={`card-blog-${post.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge
                          variant={post.isPublished ? "default" : "secondary"}
                        >
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {post.excerpt ||
                          (post.content
                            ? post.content.substring(0, 150) + "..."
                            : "No content")}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Views: {post.viewCount || 0}</span>
                        <span>
                          Created:{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.publishedAt && (
                          <span>
                            Published:{" "}
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/edit/${post.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-blog-${post.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      {post.isPublished && (
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-view-blog-${post.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-delete-blog-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Blog Post
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
