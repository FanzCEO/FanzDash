import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sticker, Upload, Trash2, Edit, Plus, Search } from "lucide-react";
import { SEOHeadTags } from "@/components/SEOHeadTags";

export default function StickersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const stickerStats = {
    totalStickers: 2847,
    totalPacks: 156,
    activeUsers: 45230,
    dailyUsage: 892143,
  };

  const stickerPacks = [
    {
      id: 1,
      name: "Cyberpunk Emojis",
      stickers: 24,
      category: "tech",
      status: "active",
      downloads: 5432,
    },
    {
      id: 2,
      name: "Creator Reactions",
      stickers: 18,
      category: "reactions",
      status: "active",
      downloads: 8901,
    },
    {
      id: 3,
      name: "FanzDash Branded",
      stickers: 12,
      category: "brand",
      status: "active",
      downloads: 3210,
    },
    {
      id: 4,
      name: "Seasonal Collection",
      stickers: 36,
      category: "seasonal",
      status: "draft",
      downloads: 0,
    },
  ];

  return (
    <div className="min-h-screen p-6 cyber-bg">
      <SEOHeadTags
        title="Stickers Management - FanzDash"
        description="Manage emoji and sticker collections for enhanced user engagement"
        canonicalUrl="https://fanzdash.com/stickers-management"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Stickers Management
            </h1>
            <p className="text-muted-foreground">Emoji & sticker collections</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cyber-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Sticker Pack
              </Button>
            </DialogTrigger>
            <DialogContent className="cyber-border">
              <DialogHeader>
                <DialogTitle>Create New Sticker Pack</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Pack name" className="glass-effect" />
                <Input placeholder="Category" className="glass-effect" />
                <Button className="w-full cyber-button">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Stickers
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Stickers
                  </p>
                  <p className="text-2xl font-bold cyber-text-glow">
                    {stickerStats.totalStickers.toLocaleString()}
                  </p>
                </div>
                <Sticker className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sticker Packs</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stickerStats.totalPacks}
                  </p>
                </div>
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stickerStats.activeUsers.toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Online</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Usage</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stickerStats.dailyUsage.toLocaleString()}
                  </p>
                </div>
                <Sticker className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="cyber-border">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sticker packs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect"
                />
              </div>
              <Button variant="outline" className="cyber-border">
                Filter by Category
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sticker Packs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stickerPacks.map((pack) => (
            <Card key={pack.id} className="cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  <Badge
                    variant={pack.status === "active" ? "default" : "secondary"}
                  >
                    {pack.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stickers:</span>
                    <span>{pack.stickers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="capitalize">{pack.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span>{pack.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
