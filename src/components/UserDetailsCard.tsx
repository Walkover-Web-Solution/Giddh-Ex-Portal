import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";

interface UserDetailsCardProps {
  name: string;
  contactPersons: number;
}

export function UserDetailsCard({ name, contactPersons }: UserDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">My Details</CardTitle>
        <Link href="/details" className="text-sm text-blue-600 hover:underline">
          View More
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-base font-semibold">{name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{contactPersons} Contact Persons</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
