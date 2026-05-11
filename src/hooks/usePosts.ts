import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface PostUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  profiles?: PostUser;
  status: string;
  work_time?: string;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: postsData, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles(id, name, username, profile_image_url)
      `)
      .order("created_at", { ascending: false });

      const formattedPosts = (postsData || []).map((post) => ({
        ...post,
        profiles: post.profiles || null,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error in loadPosts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (
    title: string,
    description?: string,
    workTime?: string
  ) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
  
    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title,
        description: description || null,
        status: "Pending",
        work_time: workTime || null, // 🔥 thêm
      });
  
      if (error) throw error;
  
      await loadPosts();
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  };

  const updatePostStatus = async (postId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ status })
        .eq("id", postId);
  
      if (error) throw error;
  
      await loadPosts(); // reload lại list
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return {
    posts,
    isLoading,
    createPost,
    loadPosts,
    updatePostStatus,
    refetch: loadPosts,
  };
};