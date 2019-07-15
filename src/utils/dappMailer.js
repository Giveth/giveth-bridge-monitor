/* eslint-disable no-param-reassign */

const logger = require('winston');
const rp = require('request-promise');

const sendEmail = (app, data) => {
  // add the dapp url that this feathers serves for
  Object.assign(data, { dappUrl: app.get('dappUrl') });
  const dappMailerUrl = app.get('dappMailerUrl');

  if (!dappMailerUrl) {
    logger.info(`skipping email notification. Missing dappMailerUrl in configuration file`);
    return;
  }
  if (!data.recipient) {
    logger.info(`skipping email notification to ${data.recipient} > ${data.unsubscribeType}`);
    return;
  }

  logger.info(`sending email notification to ${data.recipient} > ${data.unsubscribeType}`);

  // add host to subject for development
  if (!app.get('title').includes('beta')) {
    data.subject = `[${app.get('title')}] - ${data.subject}`;
  }

  rp({
    method: 'POST',
    url: `${dappMailerUrl}/send`,
    headers: {
      Authorization: app.get('dappMailerSecret'),
    },
    form: data,
    json: true,
  })
    .then(res => {
      logger.info(`email sent to ${data.recipient}: `, res);
    })
    .catch(err => {
      logger.error(`error sending email to ${data.recipient}`, err);
    });
};

module.exports = {
  milestonePaid: (app, data) => {
    Object.assign(data, {
      template: 'notification',
      subject: 'Giveth - Milestone paid',
      type: 'milestone-paid',
      secretIntro: `Your milestone ${data.milestoneTitle} has been paid.`,
      title: 'Milestone paid.',
      image: 'Giveth-milestone-review-approved-banner-email.png',
      text: `
        <p><span style="line-height: 33px; font-size: 22px;">Hi ${data.user}</span></p>
        <p>The following payments have been initiated for your milestone <em>${
          data.milestoneTitle
        }</em>:</p>
        <p></p>
        <p>${data.amount} ${data.token}</p>
        <p></p>
        <p>You can expect to see these payment(s) to arrive in your wallet <em>${
          data.address
        }</em> within 1 - 4 hrs.</p>
      `,
      cta: `See your Milestones`,
      ctaRelativeUrl: `/my-milestones`,
      unsubscribeType: 'milestone-paid',
      unsubscribeReason: `You receive this email because you are the recipient of a milestone`,
    });

    sendEmail(app, data);
  },
};
