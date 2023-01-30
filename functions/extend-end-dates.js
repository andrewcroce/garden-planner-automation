exports.extendEndDates = async ({ notion, calendar }) => {

  try {
    // Get the current date
    const currentDate = new Date().toISOString().slice(0,10)

    // Get the list of calendar entries
    const entries = await notion.databases.query({ database_id: calendar.id })

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

      // If the entry has a date, and isn't done already
      // To do: theres probably a safer way to do this, not relying on the name of the property value
      if (
        dateProp.date 
        && statusProp.select
        && statusProp.select.name !== "Failed"
        && statusProp.select.name !== "Harvested"
      ) {

        // Build an updated date object
        const updatedDate = Object.assign(dateProp.date, {
          start: dateProp.date.start,
          end: currentDate
        })

        // Do the update
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
  } catch (err) {
      console.log("ERROR: ",err)
  }
}