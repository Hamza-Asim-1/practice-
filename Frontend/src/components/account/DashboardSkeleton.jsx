import React from 'react';

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-black/[0.03] to-transparent" />
);

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-10">
        {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 md:p-6 rounded-2xl bg-white border border-black/5 relative overflow-hidden">
                <div className="w-24 h-8 bg-black/5 rounded-lg mb-2" />
                <div className="w-16 h-3 bg-black/5 rounded" />
                <Shimmer />
            </div>
        ))}
    </div>
);

export const OrderItemSkeleton = () => (
    <div className="flex items-center gap-3 md:gap-5 p-4 md:p-5 rounded-2xl border border-black/5 bg-white relative overflow-hidden">
        <div className="w-2.5 h-2.5 rounded-full bg-black/5 shrink-0" />
        <div className="flex-1">
            <div className="w-32 h-4 bg-black/5 rounded mb-2" />
            <div className="w-20 h-3 bg-black/5 rounded" />
        </div>
        <div className="w-16 h-5 bg-black/5 rounded-full hidden md:block" />
        <div className="w-12 h-6 bg-black/5 rounded shrink-0" />
        <Shimmer />
    </div>
);

export const OrderListSkeleton = ({ count = 4 }) => (
    <div className="flex flex-col gap-3">
        {[...Array(count)].map((_, i) => (
            <OrderItemSkeleton key={i} />
        ))}
    </div>
);

export const ProfileSkeleton = () => (
    <div className="rounded-2xl border border-black/5 bg-white divide-y divide-black/5 relative overflow-hidden">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 md:px-6 py-4">
                <div className="w-4 h-4 rounded bg-black/5 shrink-0" />
                <div className="w-20 h-3 bg-black/5 rounded shrink-0" />
                <div className="w-32 h-4 bg-black/5 rounded ml-auto" />
            </div>
        ))}
        <Shimmer />
    </div>
);

export const OrderTrackingSkeleton = () => (
    <div className="animate-in fade-in duration-500">
        <div className="w-48 h-4 bg-black/5 rounded mb-12" />
        
        {/* Stepper Skeleton */}
        <div className="flex justify-between gap-4 mb-12 max-w-[800px]">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col items-center flex-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/5 mb-3" />
                    <div className="w-12 h-2 bg-black/5 rounded" />
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="lg:col-span-2">
                <div className="h-[400px] bg-white border border-black/5 rounded-3xl p-8">
                    <div className="w-32 h-6 bg-black/5 rounded mb-8" />
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-6 items-center">
                                <div className="w-16 h-16 rounded-2xl bg-black/5 shrink-0" />
                                <div className="flex-1">
                                    <div className="w-40 h-4 bg-black/5 rounded mb-2" />
                                    <div className="w-24 h-3 bg-black/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-[250px] bg-white border border-black/5 rounded-3xl p-8 overflow-hidden relative">
                <Shimmer />
            </div>
        </div>
    </div>
);
