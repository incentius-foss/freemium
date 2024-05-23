<template>
  <q-page class="tw-py-4 tw-pr-4 tw-flex tw-flex-col">
    <div class="tw-h-full tw-grow tw-w-full glass-body glass-border tw-rounded-2xl tw-overflow-hidden tw-flex tw-flex-col">
      <div class="tw-p-4 tw-shrink-0 tw-flex tw-items-center tw-justify-between">
        <div>
          <div class="tw-text-2xl tw-font-bold">Cron Job Parser</div>
          <div class="tw-font-bold tw-text-gray-400">Parse Cron Job Schedules</div>
        </div>
      </div>
      <div class="tw-flex tw-flex-col tw-gap-4 tw-px-4 tw-grow tw-pb-4">
        <q-input v-model="cronExpression" type="text" placeholder="Enter cron expression..." outlined class="tw-mb-4" />
        <q-select v-model="selectedExample" :options="examples" label="Pick an example..." @input="updateCronExpression" outlined class="tw-mb-4" />
        <q-btn @click="parseCron" no-caps unelevated size="1.1em" class="tw-rounded-lg tw-bg-green-700 tw-mb-4">Parse</q-btn>
        <div v-if="parsed">
          <div>
            <strong>Minutes:</strong> {{ parsed.minutes }}
          </div>
          <div>
            <strong>Hours:</strong> {{ parsed.hours }}
          </div>
          <div>
            <strong>Day of Month:</strong> {{ parsed.dayOfMonth }}
          </div>
          <div>
            <strong>Months:</strong> {{ parsed.months }}
          </div>
          <div>
            <strong>Day of Week:</strong> {{ parsed.dayOfWeek }}
          </div>
          <div>
            <strong>Next executions (Local time):</strong>
            <ul>
              <li v-for="(exec, index) in parsed.nextExecutions" :key="index">{{ exec }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import cronParser from 'cron-parser'; // Make sure to install cron-parser via npm

export default defineComponent({
  name: 'CronJobParser',
  setup() {
    const cronExpression = ref('*/5 * * * *');
    const selectedExample = ref('');
    const parsed = ref(null);

    const examples = [
      { label: 'Every Minute (* * * * *)', value: '* * * * *' },
      { label: 'Every Five Minutes (*/5 * * * *)', value: '*/5 * * * *' },
      { label: 'Every 30 Minutes (*/30 * * * *)', value: '*/30 * * * *' },
      { label: 'Every Hour (0 * * * *)', value: '0 * * * *' },
      { label: 'Every Six Hours (0 */6 * * *)', value: '0 */6 * * *' },
      { label: 'During the Work Day (*/5 9-17 * * *)', value: '*/5 9-17 * * *' },
      { label: 'Every day at Midnight (0 0 * * *)', value: '0 0 * * *' },
      { label: 'Every day at 2 AM (0 2 * * *)', value: '0 2 * * *' },
      { label: 'Every Sunday at Midnight (0 0 * * SUN)', value: '0 0 * * SUN' },
      { label: 'Every Weekday at Midnight (0 0 * * 1-5)', value: '0 0 * * 1-5' },
      { label: 'At the Start of Every Month (0 0 1 * *)', value: '0 0 1 * *' },
      { label: 'On January 1st at Midnight (0 0 1 1 *)', value: '0 0 1 1 *' },
      { label: 'Hourly at Minute 0 from 9am to 5pm (0 9-17 * * *)', value: '0 9-17 * * *' },
      { label: 'Once a Month (0 0 1 * *)', value: '0 0 1 * *' }
    ];

    const updateCronExpression = () => {
      cronExpression.value = selectedExample.value;
    };

    const parseCron = () => {
      try {
        const interval = cronParser.parseExpression(cronExpression.value);
        const nextExecutions = [];
        for (let i = 0; i < 5; i++) {
          nextExecutions.push(interval.next().toString());
        }
        parsed.value = {
          minutes: interval.fields.minute.join(', '),
          hours: interval.fields.hour.join(', '),
          dayOfMonth: interval.fields.dayOfMonth.join(', '),
          months: interval.fields.month.join(', '),
          dayOfWeek: interval.fields.dayOfWeek.join(', '),
          nextExecutions
        };
      } catch (err) {
        console.error(err);
      }
    };

    return {
      cronExpression,
      selectedExample,
      examples,
      parsed,
      updateCronExpression,
      parseCron
    };
  }
});
</script>

<style scoped>
</style>
