import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const defaultAvatar = "https://raw.githubusercontent.com/Fresh-Teacher/glorious-gateway-65056-78561-35497/main/src/assets/default-avatar.png";

interface PhotoDialogProps {
  photoUrl?: string | null;
  userName: string;
  size?: string;
}

export function PhotoDialog({ photoUrl, userName, size = "h-20 w-20" }: PhotoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className={`cursor-pointer hover:opacity-80 transition-opacity ${size}`}>
          <AvatarImage src={photoUrl || defaultAvatar} alt="User avatar" />
          <AvatarFallback>
            <img src={defaultAvatar} alt="User avatar" className="h-full w-full object-cover" />
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={photoUrl || defaultAvatar}
            alt={`${userName}'s photo`}
            className="w-full h-auto max-h-96 object-contain rounded-lg"
          />
          <p className="text-lg font-medium text-center">{userName}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}