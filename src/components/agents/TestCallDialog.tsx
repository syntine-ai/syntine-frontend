import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { makeTestCall } from "@/api/services/calls.service";

interface TestCallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentId: string;
    agentName: string;
    hasPhoneNumber: boolean;
}

export function TestCallDialog({
    open,
    onOpenChange,
    agentId,
    agentName,
    hasPhoneNumber,
}: TestCallDialogProps) {
    const [phoneNumber, setPhoneNumber] = useState("+91");
    const [isLoading, setIsLoading] = useState(false);

    const handleMakeCall = async () => {
        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (!phoneNumber.startsWith("+")) {
            toast.error("Phone number must start with country code (e.g., +91)");
            return;
        }

        try {
            setIsLoading(true);

            const response = await makeTestCall(agentId, phoneNumber);

            if (response.success) {
                toast.success("Test call initiated!", {
                    description: `Calling ${phoneNumber}...`,
                });
                onOpenChange(false);
                setPhoneNumber("+91");
            } else {
                toast.error(response.message || "Failed to initiate call");
            }
        } catch (error: any) {
            console.error("Test call error:", error);
            toast.error(error.message || "Failed to make test call");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PhoneCall className="h-5 w-5 text-primary" />
                        Test Call
                    </DialogTitle>
                    <DialogDescription>
                        Make a test call using <strong>{agentName}</strong> agent.
                        {!hasPhoneNumber && (
                            <span className="block mt-2 text-destructive">
                                ⚠️ This agent has no phone number assigned. Please assign a number first.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone-number">Phone Number to Call</Label>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                                id="phone-number"
                                type="tel"
                                placeholder="+91XXXXXXXXXX"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex-1 font-mono"
                                disabled={!hasPhoneNumber || isLoading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter the phone number with country code (e.g., +91 for India)
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMakeCall}
                        disabled={!hasPhoneNumber || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calling...
                            </>
                        ) : (
                            <>
                                <Phone className="mr-2 h-4 w-4" />
                                Make Call
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
