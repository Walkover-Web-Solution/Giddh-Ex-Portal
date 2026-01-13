"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectUserDetails, selectUserDetailsLoading } from "@/store/slices/companySlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";

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
          <h1 className="text-xl font-semibold">Hello!</h1>
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
        <h1 className="text-xl font-semibold">Hello!</h1>
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
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Name</div>
                    <div className="mt-1 text-base font-semibold">{data?.name || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">Email</div>
                    <div className="mt-1 text-base">{data?.email || "N/A"}</div>
                  </div>

                  {data?.addresses && data.addresses.length > 0 && (
                    <>
                      <div>
                        <div className="text-sm font-medium text-gray-500">BILLING ADDRESS</div>
                        <div className="mt-1 space-y-1 text-sm">
                          <div className="font-medium">{data.name}</div>
                          <div>{data.email}</div>
                          {data.addresses[0]?.address && <div>{data.addresses[0].address}</div>}
                          {data.addresses[0]?.state?.name && (
                            <div>
                              {data.addresses[0].state.name}
                              <br />
                              {data.addresses[0].stateCode}
                            </div>
                          )}
                        </div>
                      </div>

                      {data.addresses.length > 1 && data.addresses[1] && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">SHIPPING ADDRESS</div>
                          <div className="mt-1 space-y-1 text-sm">
                            <div className="font-medium">{data.name}</div>
                            <div>{data.email}</div>
                            {data.addresses[1]?.address && <div>{data.addresses[1].address}</div>}
                            {data.addresses[1]?.state?.name && (
                              <div>
                                {data.addresses[1].state.name}
                                <br />
                                {data.addresses[1].stateCode}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
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
                  <div className="space-y-4">
                    {data.contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.email}</div>
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
