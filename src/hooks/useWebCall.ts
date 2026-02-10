/**
 * useWebCall Hook
 * Manages LiveKit web call lifecycle: connect, mute, disconnect, timer.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Room,
    RoomEvent,
    ConnectionState,
    Track,
    RemoteTrack,
    RemoteTrackPublication,
    RemoteParticipant,
} from 'livekit-client';

export type WebCallState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebCallReturn {
    state: WebCallState;
    isMuted: boolean;
    duration: number;
    errorMessage: string | null;
    connect: (url: string, token: string) => Promise<void>;
    disconnect: () => void;
    toggleMute: () => void;
}

export function useWebCall(): UseWebCallReturn {
    const [state, setState] = useState<WebCallState>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const roomRef = useRef<Room | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup timer
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Start duration timer
    const startTimer = useCallback(() => {
        setDuration(0);
        timerRef.current = setInterval(() => {
            setDuration((d) => d + 1);
        }, 1000);
    }, []);

    // Handle incoming audio tracks from the agent
    const handleTrackSubscribed = useCallback(
        (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
            if (track.kind === Track.Kind.Audio) {
                // Create audio element for agent's voice
                const audioEl = track.attach();
                audioEl.id = 'agent-audio';
                document.body.appendChild(audioEl);
                audioElementRef.current = audioEl;
            }
        },
        []
    );

    const handleTrackUnsubscribed = useCallback(
        (track: RemoteTrack) => {
            if (track.kind === Track.Kind.Audio) {
                track.detach().forEach((el) => el.remove());
                audioElementRef.current = null;
            }
        },
        []
    );

    // Connect to LiveKit room
    const connect = useCallback(
        async (url: string, token: string) => {
            try {
                setState('connecting');
                setErrorMessage(null);
                setDuration(0);

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    audioCaptureDefaults: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });

                roomRef.current = room;

                // Listen for agent audio
                room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
                room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

                // Connection state changes
                room.on(RoomEvent.ConnectionStateChanged, (connectionState: ConnectionState) => {
                    if (connectionState === ConnectionState.Connected) {
                        setState('connected');
                        startTimer();
                    } else if (connectionState === ConnectionState.Disconnected) {
                        setState('disconnected');
                        stopTimer();
                    }
                });

                room.on(RoomEvent.Disconnected, () => {
                    setState('disconnected');
                    stopTimer();
                });

                // Connect and publish microphone
                await room.connect(url, token);
                await room.localParticipant.setMicrophoneEnabled(true);
            } catch (err: any) {
                console.error('WebCall connection error:', err);
                setState('error');
                setErrorMessage(err.message || 'Failed to connect');
                stopTimer();
            }
        },
        [handleTrackSubscribed, handleTrackUnsubscribed, startTimer, stopTimer]
    );

    // Disconnect from room
    const disconnect = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.disconnect(true);
            roomRef.current = null;
        }
        // Cleanup audio elements
        if (audioElementRef.current) {
            audioElementRef.current.remove();
            audioElementRef.current = null;
        }
        setState('disconnected');
        stopTimer();
    }, [stopTimer]);

    // Toggle microphone mute
    const toggleMute = useCallback(() => {
        if (roomRef.current?.localParticipant) {
            const newMuted = !isMuted;
            roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
            setIsMuted(newMuted);
        }
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.disconnect(true);
            }
            stopTimer();
            if (audioElementRef.current) {
                audioElementRef.current.remove();
            }
        };
    }, [stopTimer]);

    return {
        state,
        isMuted,
        duration,
        errorMessage,
        connect,
        disconnect,
        toggleMute,
    };
}
