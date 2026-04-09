import { useState } from "react";
import { Linkedin, Github, Twitter, Loader2, Sparkles, User, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export interface ScrapedProfileData {
  name?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  projects?: { name: string; description: string; url?: string }[];
  experience?: { title: string; company: string; duration?: string }[];
  socialLinks?: { platform: string; url: string }[];
}

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileScraped: (data: ScrapedProfileData) => void;
  projectType: string;
}

export default function OnboardingModal({
  open,
  onOpenChange,
  onProfileScraped,
  projectType,
}: OnboardingModalProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("linkedin");

  const isPortfolioOrPersonal = projectType === "portfolio" || projectType === "personal";

  const handleScrape = async () => {
    const urls: { platform: string; url: string }[] = [];
    
    if (linkedinUrl.trim()) urls.push({ platform: "linkedin", url: linkedinUrl.trim() });
    if (githubUrl.trim()) urls.push({ platform: "github", url: githubUrl.trim() });
    if (twitterUrl.trim()) urls.push({ platform: "twitter", url: twitterUrl.trim() });

    if (urls.length === 0) {
      toast({ title: "Please enter at least one profile URL", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Simulate profile scraping - in production this would call a real scraping API
      // For now, we'll extract usernames and generate enhanced context
      const profileData: ScrapedProfileData = {
        socialLinks: urls,
      };

      // Extract LinkedIn username
      if (linkedinUrl) {
        const linkedinMatch = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        if (linkedinMatch) {
          const username = linkedinMatch[1].replace(/-/g, " ");
          profileData.name = username.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
      }

      // Extract GitHub username and simulate project data
      if (githubUrl) {
        const githubMatch = githubUrl.match(/github\.com\/([^\/\?]+)/);
        if (githubMatch) {
          const username = githubMatch[1];
          profileData.projects = [
            { name: `${username}'s Projects`, description: "View projects on GitHub", url: githubUrl },
          ];
          if (!profileData.name) {
            profileData.name = username;
          }
        }
      }

      // Extract Twitter/X username
      if (twitterUrl) {
        const twitterMatch = twitterUrl.match(/(?:twitter|x)\.com\/([^\/\?]+)/);
        if (twitterMatch) {
          const username = twitterMatch[1];
          if (!profileData.name) {
            profileData.name = username;
          }
        }
      }

      // Simulate delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      onProfileScraped(profileData);
      onOpenChange(false);
      toast({ title: "Profile data imported!", description: "Your information has been added to the generator." });
    } catch (error) {
      console.error("Scraping error:", error);
      toast({ title: "Failed to import profile", description: "Please check your URLs and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalize Your Landing Page
          </DialogTitle>
          <DialogDescription>
            {isPortfolioOrPersonal
              ? "Import your profile to replace placeholder content with your real information."
              : "Add your social profiles to generate authentic content for your landing page."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="linkedin" className="text-xs">
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="github" className="text-xs">
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="twitter" className="text-xs">
              <Twitter className="h-4 w-4 mr-1" />
              X / Twitter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm">LinkedIn Profile URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We will extract your name, headline, and experience.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="github" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="github" className="text-sm">GitHub Profile URL</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="github"
                  placeholder="https://github.com/your-username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We will extract your projects and tech stack.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-sm">X / Twitter Profile URL</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  placeholder="https://x.com/your-handle"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We will extract your bio and recent highlights.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" />
          <span>You can add multiple profiles for richer content</span>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={handleScrape} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Import Profile
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
