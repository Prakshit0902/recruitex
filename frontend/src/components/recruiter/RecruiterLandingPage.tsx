"use client";
import React from "react";
import RecruiterHero from "./sections/RecruiterHero";
import HowItWorks from "./sections/HowItWorks";
import CreativeProfiles from "./sections/CreativeProfiles";
import Testimonials from "./sections/Testimonials";
import Resources from "./sections/Resources";
import FAQ from "./sections/FAQ";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";

const RecruiterLandingPage = () => {
    return (
        <div className="recruiter-landing">
            <RecruiterHero />
            <HowItWorks />
            <CreativeProfiles />
            <Testimonials />
            <Resources />
            <FAQ />
            <FinalCTA />
            <Footer />
        </div>
    );
};

export default RecruiterLandingPage;
