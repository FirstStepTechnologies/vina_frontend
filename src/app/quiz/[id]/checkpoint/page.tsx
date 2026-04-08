"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CheckpointRedirectPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();

    useEffect(() => {
        router.replace(`/lesson/${params.id}`);
    }, [params.id, router]);

    return <div className="min-h-screen pt-20 text-center">Redirecting to your lesson...</div>;
}
