const functions = require("firebase-functions")
const { defineString } = require('firebase-functions/params')
const { Client } = require("@notionhq/client")

// My functions
const extendEndDates = require("./extend-end-dates")

// Environment variables
const NOTION_KEY = defineString("NOTION_KEY")
const NOTION_DATABASE = defineString("NOTION_DATABASE")

// Run daily at 1:00am ET
exports.updatePlantingCalendar = functions.pubsub.schedule("every day 12:50").timeZone("America/New_York")
  .onRun(async () => {
    
    try {
      // Create a new Notion client
      const notion = await new Client({ auth: NOTION_KEY.value() })

      // Get the calendar database
      const calendar = await notion.databases.retrieve({ database_id: NOTION_DATABASE.value() })

      // Extend relevant calendar entry end dates to today's date
      await extendEndDates({ notion, calendar })

    } catch (error) {
      console.log(error)
    }

    return null
  })