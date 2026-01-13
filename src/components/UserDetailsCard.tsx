"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectUserDetails,
  selectUserDetailsLoading,
  selectUserDetailsError,
} from "@/store/slices/companySlice";
import { UserDetailsSkeleton } from "@/components/skeletons/UserDetailsSkeleton";

export function UserDetailsCard() {
  const params = useParams();

  const companyName = params?.company as string;
  const country = params?.country as string;

  const data = useAppSelector(selectUserDetails(companyName));
  const loading = useAppSelector(selectUserDetailsLoading(companyName));
  const error = useAppSelector(selectUserDetailsError(companyName));

  if (loading) {
    return <UserDetailsSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">My Details</CardTitle>
        <Link
          href={`/${companyName}/${country}/details`}
          className="text-sm text-blue-600 hover:underline"
        >
          View More
        </Link>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="py-4 text-center text-sm text-red-500">{error}</div>
        ) : data ? (
          <div className="space-y-3">
            <div className="text-base font-semibold">{data.name || "N/A"}</div>
            <div className="text-sm text-gray-600">{data.email || "N/A"}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{data.contacts?.length || 0} Contact Persons</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">No user details available</div>
        )}
      </CardContent>
    </Card>
  );
}
