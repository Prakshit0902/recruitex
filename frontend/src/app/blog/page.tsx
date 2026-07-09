"use client";

import { useEffect, useState } from "react";
import { BlogService, Post } from "@/services/blogService";
import { BlogCard } from "@/components/blog/BlogCard";
import { Loader2 } from "lucide-react";

export default function BlogListPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await BlogService.getAllPosts(1, 10, search);
            setPosts((data as any).posts || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []); // Initial load

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPosts();
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Blog</h1>
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    No posts found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
