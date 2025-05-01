import { formatDuration } from "@/lib/utils";
import { useEffect, useRef } from "react";

const CallTimer = () => {
    const ref = useRef<HTMLSpanElement>(null);
    const startTime = useRef(Date.now());

    useEffect(() => {
        let frame: number;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            if (ref.current) ref.current.textContent = `Call Duration: ${formatDuration(elapsed)}s`;
            frame = requestAnimationFrame(tick);
        };

        tick(); // Start loop

        return () => cancelAnimationFrame(frame);
    }, []);

    return <span ref={ref}></span>;
};

export {CallTimer}
