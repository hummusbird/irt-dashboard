using Newtonsoft.Json;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Http.Features;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Net.NetworkInformation;
using System.IO;
using System.Formats.Asn1;
using System.Globalization;
using System;
using Microsoft.VisualBasic.FileIO;
using System.Text;
using System.Linq.Expressions;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod(); ;
        });
});

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.MapGet("csv", async () =>
{
    return Results.Json(CSV.LoadCSV());
});

app.MapGet("/", async () =>
{
    return Results.Ok("test");
});

app.UseCors(MyAllowSpecificOrigins);

app.Run();

public class Record
{
    public long StartTime { get; set; }
    public long EndTime { get; set; }
    public string ?Ticket { get; set; }
    public string ?Customer { get; set; }
    public string ?Technician { get; set; }
    public string ?CorD { get; set; }
}

public static class CSV
{
    private static readonly string path = "../READcsv.csv"; //current CSV file can't be read if being updated 
    public static List<Record> records = new List<Record>();
    public static List<Record> LoadCSV()
    {
        try
        {
            var sourceFile = new FileInfo("../outcsv.csv");
            sourceFile.CopyTo("../READcsv.csv", true);
            
            string[] fields = null;
            using (TextFieldParser csvParser = new TextFieldParser(path))
            {
                csvParser.CommentTokens = new string[] { "#" };
                csvParser.SetDelimiters(new string[] { "," });
                csvParser.HasFieldsEnclosedInQuotes = true;

                csvParser.ReadLine();

                records.Clear();

                while (!csvParser.EndOfData)
                {
                    fields = csvParser.ReadFields();
                    try
                    {
                        if (fields[0] != "Application") //ignore first row
                        {
                            Record newRecord = new Record
                            {
                                StartTime = DateTimeOffset.Parse(fields[76]).ToUnixTimeMilliseconds(),
                                EndTime = DateTimeOffset.Parse(fields[77]).ToUnixTimeMilliseconds(),
                                Ticket = UntilNextNewline(fields[7], "Question 3- Ticket Number\nAnswer- "),
                                Customer = UntilNextNewline(fields[7], "Question 2- Customers Name\nAnswer- "),
                                Technician = UntilNextNewline(fields[7], "Name: "),
                                CorD = UntilNextNewline(fields[7], "Question 1- Collection or Delivery\nAnswer- ")
                            };
                            records.Add(newRecord);
                            Console.WriteLine("New Record: " + newRecord.Ticket);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                        Console.WriteLine("failed to parse!\n");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            Console.WriteLine("Failed to read");
            return records;
        }
        Console.WriteLine(records.Count() + " records");
        return records;
    }

    public static string UntilNextNewline(string str, string FirstString) // sometimes Q4 is missing so use this instead of static spacing
    {
        string FinalString;

        int Pos1 = str.IndexOf(FirstString) + FirstString.Length;
        int validlength = str.Substring(Pos1).IndexOf("\n");
        FinalString = str.Substring(Pos1, Pos1 + validlength - Pos1);
        return FinalString;
    }
}