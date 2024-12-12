import { db } from "../db";
import { deliveries, drivers } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { format, isSameDay } from "date-fns";

export async function autoUpdateDeliveryStatus() {
  try {
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const now = new Date();
    
    // Check if it's 3:30 PM (15:30) for lunch deliveries or 10:00 PM (22:00) for dinner deliveries
    const isLunchDeliveryTime = currentHour === 15 && currentMinutes === 30;
    const isDinnerDeliveryTime = currentHour === 22 && currentMinutes === 0;

    if (!isLunchDeliveryTime && !isDinnerDeliveryTime) {
      return;
    }

    const slot = isLunchDeliveryTime ? "lunch" : "dinner";
    const today = format(now, 'yyyy-MM-dd');

    // Find all pending deliveries
    const pendingDeliveries = await db
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.slot, slot),
          eq(deliveries.status, "Pending")
        )
      );

    // Filter and update only current date's deliveries
    const currentDateDeliveries = pendingDeliveries.filter(delivery => 
      isSameDay(new Date(delivery.date), now)
    );

    // Update each delivery and its associated driver
    for (const delivery of currentDateDeliveries) {
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

    if (currentDateDeliveries.length > 0) {
      console.log(`Auto-updated ${currentDateDeliveries.length} ${slot} deliveries to Delivered status for ${format(now, 'yyyy-MM-dd')}`);
    }
  } catch (error) {
    console.error('Error in auto-updating delivery status:', error);
  }
}
