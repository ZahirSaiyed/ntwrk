import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
    }
}); 