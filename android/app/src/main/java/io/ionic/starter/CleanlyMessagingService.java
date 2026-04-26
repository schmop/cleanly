package de.schmoppo.cleanly;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class CleanlyMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "cleanly_default";
    private static final String CHANNEL_NAME = "Cleanly";

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        PushNotificationsPlugin.onNewToken(token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();
        String title = data.get("title");
        String body = data.get("body");
        String groupKey = data.get("groupKey");

        if (title != null && body != null && groupKey != null) {
            displayGrouped(remoteMessage, title, body, groupKey, data);
        }

        // Forward to Capacitor so JS-side `pushNotificationReceived` listeners still fire.
        PushNotificationsPlugin.sendRemoteMessage(remoteMessage);
    }

    private void displayGrouped(
        RemoteMessage remoteMessage,
        String title,
        String body,
        String groupKey,
        Map<String, String> data
    ) {
        ensureChannel();

        NotificationManagerCompat manager = NotificationManagerCompat.from(this);
        if (!manager.areNotificationsEnabled()) {
            return;
        }

        int notificationId = entityNotificationId(groupKey, data);
        int summaryId = groupSummaryId(groupKey);

        NotificationCompat.Builder child = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.push_logo)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setGroup(groupKey)
            .setContentIntent(buildTapIntent(remoteMessage.getMessageId(), data, notificationId));

        String summaryText = data.get("groupSummary");
        if (summaryText == null) {
            summaryText = "Cleanly";
        }
        NotificationCompat.Builder summary = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.push_logo)
            .setContentTitle(summaryText)
            .setStyle(new NotificationCompat.InboxStyle().setSummaryText(summaryText))
            .setGroup(groupKey)
            .setGroupSummary(true)
            .setAutoCancel(true)
            .setContentIntent(buildTapIntent(remoteMessage.getMessageId(), data, summaryId));

        try {
            manager.notify(notificationId, child.build());
            manager.notify(summaryId, summary.build());
        } catch (SecurityException ignored) {
        }
    }

    private PendingIntent buildTapIntent(@Nullable String messageId, Map<String, String> data, int requestCode) {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        // Capacitor's plugin uses `google.message_id` to detect a push-launched intent.
        launchIntent.putExtra("google.message_id", messageId != null ? messageId : Integer.toString(requestCode));
        for (Map.Entry<String, String> entry : data.entrySet()) {
            launchIntent.putExtra(entry.getKey(), entry.getValue());
        }
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(this, requestCode, launchIntent, flags);
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) {
            return;
        }
        if (manager.getNotificationChannel(CHANNEL_ID) == null) {
            manager.createNotificationChannel(
                new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
            );
        }
    }

    private static int entityNotificationId(String groupKey, Map<String, String> data) {
        // Same entity within a group → same id → replaces the previous notification (e.g. repeated
        // due-reminders for the same task collapse). Distinct entities coexist under the summary.
        String entityId = data.get("taskId");
        if (entityId == null) entityId = data.get("checklistUuid");
        if (entityId == null) entityId = data.get("transactionUuid");
        if (entityId == null) entityId = data.get("householdId");
        return (groupKey + ":" + (entityId == null ? "" : entityId)).hashCode();
    }

    private static int groupSummaryId(String groupKey) {
        return ("summary:" + groupKey).hashCode();
    }
}
