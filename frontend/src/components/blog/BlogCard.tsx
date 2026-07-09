import Link from "next/link";
import { Calendar } from "lucide-react";
import { Post } from "@/services/blogService";

export function BlogCard({ post }: { post: Post }) {
    // Use first section content as snippet if description missing? 
    // Or just show title.
    // Ideally backend should provide a snippet.

    return (
        <Link href={`/blog/${post.slug || post.id}`} className="group block h-full">
            <article className="flex flex-col h-full overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
                {post.cover_image && (
                    <div className="relative h-48 w-full overflow-hidden">
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags?.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                    <div className="mt-auto flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString()}
                        </time>
                    </div>
                </div>
            </article>
        </Link>
    );
}
