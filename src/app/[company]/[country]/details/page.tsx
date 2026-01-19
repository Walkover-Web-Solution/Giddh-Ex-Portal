"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectUserDetails, selectUserDetailsLoading } from "@/store/slices/companySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";

export default function DetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyName = params?.company as string;

  const data = useAppSelector(selectUserDetails(companyName));
  const loading = useAppSelector(selectUserDetailsLoading(companyName));

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Hello!</h1>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-32 rounded bg-gray-200"></div>
              <div className="h-64 rounded-lg bg-gray-200"></div>
              <div className="h-64 rounded-lg bg-gray-200"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <SidebarToggleButton />
          <h1 className="text-xl font-semibold">Hello!</h1>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Name</p>
                    <p className="mt-1 break-words font-semibold text-gray-900">
                      {data?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-500">Email</p>
                    <p className="mt-1 break-words text-gray-900">{data?.email || "N/A"}</p>
                  </div>

                  {data?.addresses && data.addresses.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium uppercase text-gray-500">Billing Address</p>
                        <div className="mt-2 space-y-1 rounded-md bg-gray-50 p-3">
                          <p className="font-medium">{data.name}</p>
                          <p className="break-words">{data.email}</p>
                          {data.addresses[0]?.address && (
                            <p className="break-words">{data.addresses[0].address}</p>
                          )}
                          {data.addresses[0]?.state?.name && (
                            <p>
                              {data.addresses[0].state.name}, {data.addresses[0].stateCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {data.addresses.length > 0 && data.addresses[0] && (
                        <div>
                          <p className="font-medium uppercase text-gray-500">Shipping Address</p>
                          <div className="mt-2 space-y-1 rounded-md bg-gray-50 p-3">
                            <p className="font-medium">{data.name}</p>
                            <p className="break-words">{data.email}</p>
                            {data.addresses[0]?.address && (
                              <p className="break-words">{data.addresses[0].address}</p>
                            )}
                            {data.addresses[0]?.state?.name && (
                              <p>
                                {data.addresses[0].state.name}, {data.addresses[0].stateCode}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Contact Persons</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.contacts && data.contacts.length > 0 ? (
                  <div className="space-y-3">
                    {data.contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border p-3 sm:p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="break-words font-medium text-gray-900">{contact.name}</p>
                          <p className="break-words text-sm text-gray-600">{contact.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No contact persons available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
