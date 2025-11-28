import { db } from '../server/db';
import { gtmSettings } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function insertGTMSettings() {
  try {
    console.log('Inserting GTM settings...');
    
    const gtmId = 'GTM-T8PDS7HX';
    const gaId = 'G-4L5HSFR0W5';
    
    // Check if exists
    const existing = await db
      .select()
      .from(gtmSettings)
      .where(eq(gtmSettings.containerId, gtmId))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(gtmSettings)
        .set({
          environment: 'production',
          enabled: true,
          tags: [{
            type: 'google_analytics',
            trackingId: gaId
          }],
          updatedAt: new Date()
        })
        .where(eq(gtmSettings.containerId, gtmId));
      
      console.log('✅ GTM settings updated!');
    } else {
      // Insert
      await db.insert(gtmSettings).values({
        containerId: gtmId,
        environment: 'production',
        enabled: true,
        tags: [{
          type: 'google_analytics',
          trackingId: gaId
        }],
      });
      
      console.log('✅ GTM settings inserted!');
    }

    // Verify
    const saved = await db
      .select()
      .from(gtmSettings)
      .where(eq(gtmSettings.containerId, gtmId))
      .limit(1);

    console.log('Saved settings:', JSON.stringify(saved[0], null, 2));
    console.log('\n🎉 GTM Configuration Complete!');
    console.log('GTM ID: GTM-T8PDS7HX');
    console.log('GA ID: G-4L5HSFR0W5');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

insertGTMSettings();

