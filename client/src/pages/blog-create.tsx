import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useLocation } from "wouter";
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

export default function BlogCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      featuredImage: "",
      isPublished: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: "system", // TODO: Get from current user
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      setLocation("/blog");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostForm) => {
    createMutation.mutate(data);
  };

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
              Create New Blog Post
            </h1>
            <p className="text-muted-foreground">
              Create a new blog post or article
            </p>
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
                      Recommended size: 650x430px
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
                        Publish Immediately
                      </FormLabel>
                      <FormDescription>
                        Make this blog post visible to the public immediately
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
                  disabled={createMutation.isPending}
                  data-testid="button-save-blog"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Post
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
