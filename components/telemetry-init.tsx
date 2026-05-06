"use client";
import { useEffect } from 'react';
import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

export default function TelemetryInit() {
  useEffect(() => {
    try {
      const consent = typeof window !== 'undefined' ? window.localStorage.getItem('telemetry_consent') : null;
      if (consent !== 'granted') return;

      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (posthogKey) {
        posthog.init(posthogKey, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com' });
        console.log('✅ PostHog initialized');
      }

      const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
      if (sentryDsn) {
        Sentry.init({ dsn: sentryDsn, tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.01') });
        console.log('✅ Sentry initialized (client)');
      }
    } catch (e) {
      // prevent telemetry errors from breaking the app
      // eslint-disable-next-line no-console
      console.error('Telemetry init error', e);
    }
  }, []);

  return null;
}
