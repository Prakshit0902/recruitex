"use client";

import { AppContextType, Application, AppProviderProps, User } from "@/type";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

// ── Per-Service URLs ───────────────────────────────────────────────────────────
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000";
const UTILS_URL = process.env.NEXT_PUBLIC_UTILS_URL || "http://localhost:5001";
const USER_URL = process.env.NEXT_PUBLIC_USER_URL || "http://localhost:5002";
const JOB_URL  = process.env.NEXT_PUBLIC_JOB_URL  || "http://localhost:5003";
const AI_URL   = process.env.NEXT_PUBLIC_AI_URL   || "http://localhost:5004";
const PAYMENT_URL = process.env.NEXT_PUBLIC_PAYMENT_URL || "http://localhost:5005";
const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:5006";
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:5007";

// Re-exported constants used by other pages/components
export const auth_service    = AUTH_URL;
export const user_service    = USER_URL;
export const job_service     = JOB_URL;
export const ai_service      = AI_URL;
export const utils_service   = UTILS_URL;
export const payment_service = PAYMENT_URL;
export const blog_service    = BLOG_URL;
export const chat_service    = CHAT_URL;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const token = Cookies.get("token");

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${USER_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns { message, user }
      setUser(data.user ?? data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfilePic(fromData: any) {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${USER_URL}/api/user/update/pic`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateResume(fromData: any) {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${USER_URL}/api/user/update/resume`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(name: string, phoneNumber: string, bio: string) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${USER_URL}/api/user/update/profile`,
        { name, phoneNumber, bio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.set("token", "");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }

  async function addSkill(
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${USER_URL}/api/user/skill/add`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      setSkill("");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function removeSkill(skill: string) {
    try {
      const { data } = await axios.delete(`${USER_URL}/api/user/skill/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { skillName: skill },
      });
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  async function applyJob(jobId: number) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${JOB_URL}/api/job/apply`,
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  const [applications, setApplications] = useState<Application[]>([]);

  async function fetchApplications() {
    try {
      const { data } = await axios.get(`${JOB_URL}/api/job/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend returns { message, applications: [...] }
      setApplications(data.applications ?? data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchApplications();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        setUser,
        isAuth,
        setIsAuth,
        setLoading,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
        addSkill,
        removeSkill,
        applyJob,
        applications,
        fetchApplications,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
