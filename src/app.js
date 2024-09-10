const express = require('express');
const AWS = require('aws-sdk');
const app = express();
const port = 3000;


AWS.config.update({ region: 'ap-south-1' });
const sns = new AWS.SNS();
const logGroupName = 'HelloWorldLogGroup';
const logStreamName = 'HelloWorldLogStream';

app.use(express.static('public'));

// Route to handle button click
app.post('/notify', (req, res) => {
  const params = {
    Message: 'Button clicked!',
    TopicArn: 'arn:aws:sns:ap-south-1:992382729083:Node-Application-Testing',
  };

  sns.publish(params, (err, data) => {
    if (err) {
      console.log(`Error sending SNS message: ${err}`);
      logToCloudWatch(`Error sending SNS message: ${err}`);
      res.status(500).send('Failed to send notification');
    } else {
      console.log('SNS message sent successfully');
      logToCloudWatch('SNS message sent successfully');
      res.send('Notification sent');
    }
  });
});

// Function to log messages to CloudWatch
function logToCloudWatch(message) {
  const cloudwatchlogs = new AWS.CloudWatchLogs();
  const params = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message,
        timestamp: new Date().getTime()
      }
    ]
  };

  cloudwatchlogs.describeLogStreams({ logGroupName }, (err, data) => {
    if (err) {
      console.log('Error describing log streams:', err);
      return;
    }

    const logStreamExists = data.logStreams.some(stream => stream.logStreamName === logStreamName);

    if (!logStreamExists) {
      cloudwatchlogs.createLogStream({ logGroupName, logStreamName }, (err) => {
        if (err) console.log('Error creating log stream:', err);
      });
    }

    cloudwatchlogs.putLogEvents(params, (err) => {
      if (err) console.log('Error putting log events:', err);
    });
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
