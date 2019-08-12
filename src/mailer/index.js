/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:43 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

var _ = require('lodash')
var nodeMailer = require('nodemailer')

var settings = require('../models/setting')
const sgMail = require('@sendgrid/mail')

var mailer = {}

mailer.sendMailBySendGrid = (data, callback) => {
  try {
    console.log('sendMailBySendGrid now')

    const SENDGRID_API_KEY = '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'
    sgMail.setApiKey(SENDGRID_API_KEY)

    const msg = {
      // to: 'haidtimeo@gmail.com',
      from: 'dev567478@gmail.com',
      // subject: 'Sending with Twilio SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js'
      // html: '<strong>and easy to do anywhere, even with Node.js</strong>'
    }
    Object.assign(msg, data)
    sgMail.send(msg, (err, res) => {
      if (err) {
        callback(err)
      } else {
        console.log('no error')
        callback(null)
      }
    })
  } catch (error) {
    console.log('sendMailBySendGrid : ', error)
    callback(error)
  }
}
mailer.sendMail = function (data, callback) {
  createTransporter(function (err, mailSettings) {
    // console.log('sendMail mailSettings', mailSettings)
    if (err) {
      console.log('send mail error', err)
      return callback(err)
    }
    if (!mailSettings || !mailSettings.enabled) {
      // Mail Disabled
      console.log('mail is disable')

      return callback(null, 'Mail Disabled')
    }

    if (!mailSettings.from) return callback('No From Address Set.')

    data.from = mailSettings.from.value

    if (!data.from) return callback('No From Address Set.')
    console.log('sendMail now, data.to ', data.to)
    mailSettings.transporter.sendMail(data, callback)
  })
}

mailer.verify = function (callback) {
  createTransporter(function (err, mailSettings) {
    console.log('verify mail ', mailSettings, err)
    if (err) return callback(err)

    if (!mailSettings.enabled) return callback({ code: 'Mail Disabled' })

    mailSettings.transporter.verify(function (err) {
      if (err) return callback(err)

      return callback()
    })
  })
}

function createTransporter (callback) {
  settings.getSettings(function (err, s) {
    if (err) return callback(err)

    var mailSettings = {}
    mailSettings.enabled = _.find(s, function (x) {
      return x.name === 'mailer:enable'
    })
    mailSettings.host = _.find(s, function (x) {
      return x.name === 'mailer:host'
    })
    mailSettings.ssl = _.find(s, function (x) {
      return x.name === 'mailer:ssl'
    })
    mailSettings.port = _.find(s, function (x) {
      return x.name === 'mailer:port'
    })
    mailSettings.username = _.find(s, function (x) {
      return x.name === 'mailer:username'
    })
    mailSettings.password = _.find(s, function (x) {
      return x.name === 'mailer:password'
    })
    mailSettings.from = _.find(s, function (x) {
      return x.name === 'mailer:from'
    })

    mailSettings.enabled = mailSettings.enabled && mailSettings.enabled.value ? mailSettings.enabled.value : false

    var transport = {
      host: mailSettings.host && mailSettings.host.value ? mailSettings.host.value : '127.0.0.1',
      port: mailSettings.port && mailSettings.port.value ? mailSettings.port.value : 25,
      secure: mailSettings.ssl && mailSettings.ssl.value ? mailSettings.ssl.value : false,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    }
    if (mailSettings.username && mailSettings.username.value) {
      transport.auth = {
        user: mailSettings.username.value,
        pass: mailSettings.password && mailSettings.password.value ? mailSettings.password.value : ''
      }
    }
    // console.log('mailSettings', mailSettings)
    // console.log('transport', transport)

    // mailSettings.transporter = nodeMailer.createTransport(transport)
    mailSettings.transporter = nodeMailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'dev567478@gmail.com',
        pass: 'testdev123456'
      }
    })
    // mailSettings.from = 'dev567478@gmail.com';
    mailer.transporter = mailSettings.transporter

    return callback(null, mailSettings)
  })
}

module.exports = mailer
