import { db } from "../db";
import { deliveries, drivers } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export async function autoUpdateDeliveryStatus() {
  try {
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    
    // Check if it's 3:30 PM (15:30) for lunch deliveries or 10:00 PM (22:00) for dinner deliveries
    const isLunchDeliveryTime = currentHour === 15 && currentMinutes === 30;
    const isDinnerDeliveryTime = currentHour === 22 && currentMinutes === 0;

    if (!isLunchDeliveryTime && !isDinnerDeliveryTime) {
      return;
    }

    const slot = isLunchDeliveryTime ? "lunch" : "dinner";
    const today = format(new Date(), 'yyyy-MM-dd');

    // Find all pending deliveries for the current slot
    const pendingDeliveries = await db
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.slot, slot),
          eq(deliveries.status, "Pending"),
          eq(deliveries.date, new Date(today))
        )
      );

    // Update each delivery and its associated driver
    for (const delivery of pendingDeliveries) {
      await db.transaction(async (tx) => {
        // Update delivery status
        await tx
          .update(deliveries)
          .set({
            status: "Delivered",
            completedAt: new Date(),
            notes: `Auto-delivered at ${new Date().toLocaleTimeString()}`
          })
          .where(eq(deliveries.id, delivery.id));

        // Update driver status if assigned
        if (delivery.driverId) {
          await tx
            .update(drivers)
            .set({
              status: "available",
              lastUpdated: new Date()
            })
            .where(eq(drivers.id, delivery.driverId));
        }
      });
    }

    console.log(`Auto-updated ${pendingDeliveries.length} ${slot} deliveries to Delivered status`);
  } catch (error) {
    console.error('Error in auto-updating delivery status:', error);
  }
}
