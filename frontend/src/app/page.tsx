"use client";
import Loading from "@/components/loading";
import RecruiterLandingPage from "@/components/recruiter/RecruiterLandingPage";
import JobSeekerLandingPage from "@/components/JobSeekerLandingPage";
import { useAppData } from "@/context/AppContext";
import React from "react";

const Home = () => {
  const { loading, user, isAuth } = useAppData();
  if (loading) return <Loading />;

  if (isAuth && user?.role === "recruiter") {
    return <RecruiterLandingPage />;
  }

  return <JobSeekerLandingPage />;
};

export default Home;
