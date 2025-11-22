"use client";

import { User } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Upload, DollarSign, FileText, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialViewProps {
  users: User[];
  currentUser: User;
}

export default function SocialView({ users, currentUser }: SocialViewProps) {
  const sortedUsers = [...users].sort((a, b) => b.totalUpvotes - a.totalUpvotes);

  return (
    <div className="h-full w-full bg-background flex flex-col pt-12 px-4 pb-4">
        {/* Back to Home Indicator */}
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center text-muted-foreground animate-pulse z-10">
        <div className="flex flex-col items-center gap-1">
          <ChevronUp className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-widest">Swipe Up for Home</span>
        </div>
      </div>

      <Tabs defaultValue="leaderboard" className="flex-1 flex flex-col mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="flex-1 overflow-hidden flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-4">
                  {sortedUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0 ? "bg-yellow-500 text-black" :
                          index === 1 ? "bg-gray-300 text-black" :
                          index === 2 ? "bg-amber-700 text-white" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.notesPosted} notes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{user.totalUpvotes.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Upvotes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="flex-1 overflow-hidden flex flex-col">
          <Card className="flex-1 border-border/50 bg-card/50">
            <CardContent className="p-6 flex flex-col items-center h-full">
              <div className="mt-4 mb-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-muted-foreground">University of Tech</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-muted/30 p-4 rounded-xl border border-border/30 text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">${currentUser.earnings}</p>
                  <p className="text-xs text-muted-foreground uppercase">Earnings</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/30 text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{currentUser.notesPosted}</p>
                  <p className="text-xs text-muted-foreground uppercase">Notes Posted</p>
                </div>
              </div>

              <Button className="w-full h-12 text-lg font-semibold gap-2 shadow-lg shadow-primary/20">
                <Upload className="h-5 w-5" />
                Upload New Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
