import { Client, LogLevel } from "@notionhq/client"

async function updatePlantingCalendar() {
  try {
    // Get the Notion API key from environment variable
    const notionKey = process.env.NOTION_KEY

    // Get the calendar page ID from environment variable
    const databaseId = process.env.NOTION_DATABASE

    // Get the current date
    const currentDate = new Date().toISOString().slice(0,10)

    // Create a new Notion client
    // const notion = new Client({ auth: api_key, logLevel: LogLevel.INFO })
    const notion = new Client({ auth: notionKey })

    // Get the calendar database
    const calendar = await notion.databases.retrieve({ database_id: databaseId })

    // Get the list of calendar entries
    const entries = await notion.databases.query({ database_id: databaseId })

    // Get the property IDs of the Date & Status properties
    const datePropId = calendar.properties["Date"].id
    const statusPropId = calendar.properties["Status"].id

    // Update the end date of each entry if needed
    for (const entry of entries.results) {

      // Get the Date property for this entry
      const dateProp = await notion.pages.properties.retrieve({
        page_id: entry.id,
        property_id: datePropId
      })

      // Get the Status property for this entry
      const statusProp = await notion.pages.properties.retrieve({
        page_id: entry.id,
        property_id: statusPropId
      })

      if (
        dateProp.date 
        && statusProp.select
        && statusProp.select.name !== "Failed"
        && statusProp.select.name !== "Harvested"
      ) {
        // console.log("Prop DATE", dateProp)
        // console.log("Prop STATUS",statusProp)

        const updatedDate = Object.assign(dateProp.date, {
          start: dateProp.date.start,
          end: currentDate
        })

        await notion.pages.update({
          page_id: entry.id,
          properties: {
            "Date": {
              date: updatedDate
            }
          }
        })
      }
    }

    // console.log("DONE!!!!!!!")
    
  } catch (err) {
      console.log(err)
  }
}

updatePlantingCalendar()