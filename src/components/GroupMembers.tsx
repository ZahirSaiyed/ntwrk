import { Contact } from "@/types";

interface GroupMembersProps {
  title: string;
  members: Set<string>;
  contacts: Contact[];
  description?: string;
  icon?: string;
  onCreateGroup: (name: string, members: Set<string>) => void;
}

export default function GroupMembers({
  title,
  members,
  contacts,
  description,
  icon,
  onCreateGroup
}: GroupMembersProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <h4>{title}</h4>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {/* Add member list rendering as needed */}
    </div>
  );
}
