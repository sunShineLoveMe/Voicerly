# Deployment Guidance for VoxCPM Demo

This document records the estimated concurrency and scaling recommendations when publishing the current frontend together with a locally hosted VoxCPM backend.

## 1. Frontend Considerations

- The Next.js App Router frontend (served via Vercel/Netlify or any static CDN) has negligible concurrency limits in this context.
- The real bottleneck is the backend VoxCPM/Gradio service.

## 2. Backend Baseline (Mac M1, 64 GB RAM)

| Item | Voice Generation (`/generate`) | Voice Recognition (`/prompt_wav_recognition`) |
|------|--------------------------------|-----------------------------------------------|
| Typical latency | ~8–20s per request (depends on text + parameters) | ~2–5s per request (depends on audio length) |
| CPU/GPU usage | High (continuous model inference) | Medium |
| Memory usage | ~8–12 GB | ~4–6 GB |

Observations:

- On a single Mac M1, simultaneous execution quickly saturates CPU/GPU resources.
- Gradio’s `queue` feature will push extra requests into a wait queue instead of executing them all at once.

**Estimated real-time concurrency:** 1–2 users generating audio simultaneously. More users can be “online”, but they will wait in the queue and perceived latency increases linearly.

## 3. Recommended Local Load Test

1. Launch the local service.
2. Trigger 5–10 requests using a simple concurrent script (e.g., `k6`, `ab`, or custom Node/Python). Record average latency.
3. Observe CPU & memory usage via `Activity Monitor` or `htop`.
4. Adjust the maximum concurrency or queue settings according to the observed load.

## 4. Publishing Options

- **Short-term demo:** Announce that generation takes ~10–20 seconds and that requests may queue. Keep the Gradio queue enabled and show a progress indicator to users.
- **Public or high-load launch:** Move VoxCPM to a GPU host (AWS g5/g6, RunPod, Lambda Labs, etc.) and deploy a task queue or autoscaling strategy.
- **Monitoring:** Track average latency, queue length, and failure rates so you can scale pre-emptively.

## 5. Summary

The frontend is ready for public access, but the backend running on a single Mac M1 (64 GB RAM) comfortably supports **1–2 concurrent generators**. To support more users without delays, plan a GPU deployment or a managed queue with clear user feedback.

