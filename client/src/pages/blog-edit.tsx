import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, FileImage } from "lucide-react";
import { Link } from "wouter";

const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

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

export default function BlogEdit() {
  const params = useParams();
  const blogId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["/api/blog/posts", blogId],
    queryFn: () =>
      fetch(`/api/blog/posts/${blogId}`).then((res) =>
        res.json(),
      ) as Promise<BlogPost>,
    enabled: !!blogId,
  });

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      featuredImage: "",
      isPublished: false,
    },
  });

  // Update form when post data loads
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content || "",
        featuredImage: post.featuredImage || "",
        isPublished: post.isPublished,
      });
    }
  }, [post, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const response = await fetch(`/api/blog/posts/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", blogId] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setLocation("/blog");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" data-testid="button-back-to-blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Blog Post
            </h1>
            <p className="text-muted-foreground">Edit "{post.title}"</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter blog post title..."
                        data-testid="input-blog-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          placeholder="Select featured image..."
                          data-testid="input-blog-thumbnail"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // TODO: Implement file upload
                              field.onChange(file.name);
                            }
                          }}
                        />
                        <FileImage className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Recommended size: 650x430px. Current:{" "}
                      {post.featuredImage || "No image"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your blog post content here..."
                        className="min-h-[400px]"
                        data-testid="textarea-blog-content"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use rich text formatting here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Published Status
                      </FormLabel>
                      <FormDescription>
                        Control whether this blog post is visible to the public
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-blog-published"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Link href="/blog">
                  <Button variant="outline" data-testid="button-cancel-blog">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-blog"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
