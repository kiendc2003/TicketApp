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

  requester?: string;
}

export interface Requester {
  id: string;

  name: string;

  total_request: number;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const [requesters, setRequesters] =
    useState<Requester[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
    loadRequesters();
  }, [user]);

  // LOAD POSTS
  const loadPosts = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data: postsData, error } =
        await supabase
          .from("posts")
          .select(`
            *,
            profiles(
              id,
              name,
              username,
              profile_image_url
            )
          `)
          .order("created_at", {
            ascending: false,
          });

      if (error) throw error;

      const formattedPosts = (
        postsData || []
      ).map((post) => ({
        ...post,
        profiles: post.profiles || null,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error(
        "Error in loadPosts:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // LOAD REQUESTERS
  const loadRequesters = async () => {
    try {
      const { data, error } =
        await supabase
          .from("requesters")
          .select("*")
          .order("name", {
            ascending: true,
          });

      if (error) throw error;

      setRequesters(data || []);
    } catch (error) {
      console.error(
        "Error loading requesters:",
        error
      );
    }
  };

  // SAVE REQUESTER
  const saveRequester = async (
    requesterName: string
  ) => {
    try {
      const trimmed =
        requesterName.trim();
  
      if (!trimmed) return null;
  
      // CHECK EXIST
      const existing = requesters.find(
        (item) =>
          item.name.toLowerCase() ===
          trimmed.toLowerCase()
      );
  
      // EXIST
      if (existing) {
        return existing.id;
      }
  
      // NEW
      const { data, error } =
        await supabase
          .from("requesters")
          .insert({
            name: trimmed,
            total_request: 0,
          })
          .select()
          .single();
  
      if (error) throw error;
  
      await loadRequesters();
  
      return data.id;
    } catch (error) {
      console.error(
        "Error saving requester:",
        error
      );
  
      return null;
    }
  };

  // CREATE POST
  const createPost = async (
    title: string,
    description?: string,
    workTime?: string,
    requester?: string,
    requesterId?: string
  ) => {
    if (!user) {
      throw new Error(
        "User not authenticated"
      );
    }
  
    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
  
          title,
  
          description:
            description || null,
  
          status: workTime
            ? "Closed"
            : "Pending",
  
          work_time:
            workTime || null,
  
          requester:
            requester || null,
  
          requester_id:
            requesterId || null,
        });
  
      if (error) throw error;
  
      await loadPosts();
    } catch (error) {
      console.error(
        "Error in createPost:",
        error
      );
  
      throw error;
    }
  };

  // UPDATE STATUS
  const updatePostStatus = async (
    postId: string,
    status: string
  ) => {
    try {
      const currentPost = posts.find(
        (item) => item.id === postId
      );
  
      // BLOCK CLOSED -> PENDING
      if (
        currentPost?.status === "Closed" &&
        status === "Pending"
      ) {
        return;
      }
  
      const updateData: any = {
        status,
      };
  
      // 🔥 nếu close thì lấy thời gian hiện tại
      if (status === "Closed") {
        updateData.work_time =
          new Date().toISOString();
      }
  
      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", postId);
  
      if (error) throw error;
  
      await loadPosts();
    } catch (error) {
      console.error(
        "Error updating status:",
        error
      );
    }
  };

  return {
    posts,

    requesters,

    isLoading,

    createPost,

    loadPosts,

    loadRequesters,

    updatePostStatus,

    refetch: loadPosts,
  };
};