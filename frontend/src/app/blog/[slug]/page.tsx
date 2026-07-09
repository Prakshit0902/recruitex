"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlogService, Post } from "@/services/blogService";
import { Loader2, Calendar, User } from "lucide-react";
import Image from "next/image";

export default function BlogPostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            BlogService.getPostBySlug(slug as string)
                .then((data) => setPost(data as Post))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (!post) {
        return <div className="container mx-auto py-20 text-center">Post not found</div>;
    }

    return (
        <article className="container max-w-4xl mx-auto py-10 px-4">
            {/* Header */}
            <header className="mb-10 text-center">
                <div className="flex justify-center gap-2 mb-4">
                    {post.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                            {tag}
                        </span>
                    ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{post.title}</h1>
                <div className="flex items-center justify-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <time>{new Date(post.created_at).toLocaleDateString()}</time>
                    </div>
                    {/* Add Author if available in API response */}
                </div>
            </header>

            {/* Cover Image */}
            {post.cover_image && (
                <div className="relative w-full h-[400px] mb-12 rounded-xl overflow-hidden shadow-lg">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="object-cover w-full h-full"
                    />
                </div>
            )}

            {/* Dynamic Sections */}
            <div className="space-y-12">
                {post.sections?.sort((a, b) => a.order - b.order).map((section) => (
                    <section key={section.id} className="prose prose-lg dark:prose-invert max-w-none">
                        {section.heading && <h2 className="text-3xl font-bold mb-4">{section.heading}</h2>}
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        {section.image && (
                            <div className="my-6">
                                <img src={section.image} alt="" className="rounded-lg shadow-md" />
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </article>
    );
}
