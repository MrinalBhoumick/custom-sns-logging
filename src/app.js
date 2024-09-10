const express = require('express');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { CloudWatchLogsClient, DescribeLogStreamsCommand, CreateLogStreamCommand, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');
const app = express();
const port = 3000;

const snsClient = new SNSClient({ region: 'ap-south-1' });
const cloudWatchLogsClient = new CloudWatchLogsClient({ region: 'ap-south-1' });

const logGroupName = 'HelloWorldLogGroup';
const logStreamName = 'HelloWorldLogStream';

app.use(express.static('public'));

// Route to handle button click
app.post('/notify', async (req, res) => {
  const params = {
    Message: 'Button clicked!',
    TopicArn: 'arn:aws:sns:ap-south-1:992382729083:Node-Application-Testing',
  };

  try {
    await snsClient.send(new PublishCommand(params));
    console.log('SNS message sent successfully');
    await logToCloudWatch('SNS message sent successfully');
    res.send('Notification sent');
  } catch (err) {
    console.log(`Error sending SNS message: ${err}`);
    await logToCloudWatch(`Error sending SNS message: ${err}`);
    res.status(500).send('Failed to send notification');
  }
});

// Function to log messages to CloudWatch
async function logToCloudWatch(message) {
  const params = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message,
        timestamp: new Date().getTime(),
      },
    ],
  };

  try {
    const describeLogStreamsCommand = new DescribeLogStreamsCommand({ logGroupName });
    const data = await cloudWatchLogsClient.send(describeLogStreamsCommand);

    const logStreamExists = data.logStreams.some((stream) => stream.logStreamName === logStreamName);

    if (!logStreamExists) {
      const createLogStreamCommand = new CreateLogStreamCommand({ logGroupName, logStreamName });
      await cloudWatchLogsClient.send(createLogStreamCommand);
    }

    const putLogEventsCommand = new PutLogEventsCommand(params);
    await cloudWatchLogsClient.send(putLogEventsCommand);
  } catch (err) {
    console.log('Error logging to CloudWatch:', err);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
