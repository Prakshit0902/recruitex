"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  BookOpen,
  Briefcase,
  Globe,
  Home,
  Info,
  LogOut,
  Menu,
  MessageSquare,
  PenTool,
  User,
  X,
  LayoutDashboard,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { useAppData } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { isAuth, user, setIsAuth, setUser, loading, logoutUser } =
    useAppData();
  const { unreadCount } = useSocket();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logoutHandler = () => {
    logoutUser();
  };

  return (
    <nav className="z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center gap-1 group">
              <div className="text-2xl font-bold tracking-tight">
                <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Recruit
                </span>
                <span className="text-red-500">Ex</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation — Minimal */}
          <div className="hidden md:flex items-center space-x-1">
          </div>

          {/* Right side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              ""
            ) : (
              <>
                {isAuth ? (
                  <>
                    {/* Dashboard CTA */}
                    <Link href={"/account"}>
                      <Button
                        size="sm"
                        className="gap-2 rounded-full px-5"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Button>
                    </Link>

                    {/* Avatar with expanded popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity relative">
                          <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all">
                            <AvatarImage
                              src={user ? (user.profilePic as string) : undefined}
                              alt={user ? user.name : ""}
                            />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-56 p-2" align="end">
                        {/* User Info */}
                        <div className="px-3 py-2 mb-2 border-b">
                          <p className="text-sm font-semibold">
                            {user && user.name}
                          </p>
                          <p className="text-xs opacity-60 truncate">
                            {user && user.email}
                          </p>
                        </div>

                        {/* Navigation Links */}
                        <Link href={"/"}>
                          <Button
                            className="w-full justify-start gap-2"
                            variant={"ghost"}
                            size="sm"
                          >
                            <Home size={15} /> Home
                          </Button>
                        </Link>

                        <Link href={"/jobs"}>
                          <Button
                            className="w-full justify-start gap-2"
                            variant={"ghost"}
                            size="sm"
                          >
                            <Briefcase size={15} /> Jobs
                          </Button>
                        </Link>

                        {user?.role === "jobseeker" && (
                          <Link href={"/discover"}>
                            <Button
                              className="w-full justify-start gap-2"
                              variant={"ghost"}
                              size="sm"
                            >
                              <Globe size={15} /> Discover Jobs
                            </Button>
                          </Link>
                        )}

                        <Link href={"/blog"}>
                          <Button
                            className="w-full justify-start gap-2"
                            variant={"ghost"}
                            size="sm"
                          >
                            <BookOpen size={15} /> Blogs
                          </Button>
                        </Link>

                        <Link href={"/chat"}>
                          <Button
                            className="w-full justify-start gap-2 relative"
                            variant={"ghost"}
                            size="sm"
                          >
                            <MessageSquare size={15} /> Chat
                            {unreadCount > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </Button>
                        </Link>

                        {user?.role === "recruiter" && (
                          <Link href={"/recruiter/blog/create"}>
                            <Button
                              className="w-full justify-start gap-2"
                              variant={"ghost"}
                              size="sm"
                            >
                              <PenTool size={15} /> Post Blog
                            </Button>
                          </Link>
                        )}

                        <Link href={"/about"}>
                          <Button
                            className="w-full justify-start gap-2"
                            variant={"ghost"}
                            size="sm"
                          >
                            <Info size={15} /> About
                          </Button>
                        </Link>

                        {/* Divider */}
                        <div className="my-1 border-t" />

                        {/* Profile & Logout */}
                        <Link href={"/account"}>
                          <Button
                            className="w-full justify-start gap-2"
                            variant={"ghost"}
                            size="sm"
                          >
                            <User size={15} /> My Profile
                          </Button>
                        </Link>

                        {/* Theme Toggle row */}
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-sm text-muted-foreground">Theme</span>
                          <ModeToggle />
                        </div>

                        <Button
                          className="w-full justify-start gap-2 mt-1"
                          variant={"ghost"}
                          size="sm"
                          onClick={logoutHandler}
                        >
                          <LogOut size={15} />
                          Logout
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  <>
                    <Link href={"/login"}>
                      <Button className="gap-2 rounded-full px-5">
                        <User size={16} />
                        Sign In
                      </Button>
                    </Link>
                    <ModeToggle />
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div
        className={`md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-3 py-3 space-y-1 bg-background/95 backdrop-blur-md">
          <Link href={"/"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className="w-full justify-start gap-3 h-11"
            >
              <Home size={18} /> Home
            </Button>
          </Link>

          <Link href={"/jobs"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className="w-full justify-start gap-3 h-11"
            >
              <Briefcase size={18} /> Jobs
            </Button>
          </Link>

          {isAuth && user?.role === "jobseeker" && (
            <Link href={"/discover"} onClick={toggleMenu}>
              <Button
                variant={"ghost"}
                className="w-full justify-start gap-3 h-11"
              >
                <Globe size={18} /> Discover Jobs
              </Button>
            </Link>
          )}

          <Link href={"/blog"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className="w-full justify-start gap-3 h-11"
            >
              <BookOpen size={18} /> Blogs
            </Button>
          </Link>

          {isAuth && user?.role === "recruiter" && (
            <Link href={"/recruiter/blog/create"} onClick={toggleMenu}>
              <Button
                variant={"ghost"}
                className="w-full justify-start gap-3 h-11"
              >
                <PenTool size={18} /> Post Blog
              </Button>
            </Link>
          )}

          {isAuth && (
            <Link href={"/chat"} onClick={toggleMenu}>
              <Button
                variant={"ghost"}
                className="w-full justify-start gap-3 h-11 relative"
              >
                <MessageSquare size={18} /> Chat
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          <Link href={"/about"} onClick={toggleMenu}>
            <Button
              variant={"ghost"}
              className="w-full justify-start gap-3 h-11"
            >
              <Info size={18} /> About
            </Button>
          </Link>

          {isAuth ? (
            <>
              <Link href={"/account"} onClick={toggleMenu}>
                <Button
                  variant={"ghost"}
                  className="w-full justify-start gap-3 h-11"
                >
                  <User size={18} /> My Profile
                </Button>
              </Link>
              <Button
                variant={"destructive"}
                className="w-full justify-start gap-3 h-11"
                onClick={() => {
                  logoutHandler();
                  toggleMenu();
                }}
              >
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <Link href={"/login"} onClick={toggleMenu}>
              <Button className="w-full justify-start gap-3 h-11 mt-2">
                <User size={18} /> SignIn
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
