const http = require("http");
const hostname = "127.0.0.1";
const port = 7000;

const fs =require("fs");

let students = [];

try {
  const data=fs.readFileSync("students.json","utf8");
  students=JSON.parse(data);
} catch (error) {
console.error("Failed to load students : ",error);  
}
const server = http.createServer((req, res) => {
  if ((req.url === "/api/students") & (req.method === "GET")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(students));
  } else if (req.url.startsWith("/api/students") & (req.method === "GET")) {
    const id = parseInt(req.url.split("/")[3]);
    const student = students.find((s) => s.id === id);
   

    if (student) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(student));
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Student Not Found" }));
    }
  } else if ((req.url === "/api/students") & (req.method === "POST")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        //pass the json into the body
        const { id, name } = JSON.parse(body);
        //check valid
        if (!id || !name) {
          res.statusCode = 400;
          res.setHeader("Content-type", "application/json");
          res.end(
            JSON.stringify({ message: "Student id and name are required" })
          );
          return;
        }
        students.push({ id, name });
        fs.writeFileSync("students.json",JSON.stringify(students,null,2));
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            message: "Student added successfully",
            student: { id, name },
          })
        );
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  } else if (req.url.startsWith("/api/students") &&(req.method === "PUT")) {
    //Extract student id from url
    const id = parseInt(req.url.split("/")[3]);
    //prepare to read request body
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { name } = JSON.parse(body);
        const studentIndex = students.findIndex((s) => s.id === id);

        if (studentIndex === -1) {
          res.status = 404;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ message: "Student not found" }));
        }

        if (!name) {
          res.status = 400;
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ message: "Student name required" }));
        }

        students[studentIndex].name = name;
        fs.writeFileSync("students.json",JSON.stringify(students,null,2));
        res.status = 200;
        res.setHeader("Content-Type", "application/json");
        return res.end(
          JSON.stringify({
            message: "Student updated",
            student: students[studentIndex],
          })
        );
      } catch (error) {
        res.status = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  }else if(req.url.startsWith('/api/students') && req.method==='DELETE'){

    const id=parseInt(req.url.split("/")[3]);
    const initialLength=students.length;
    students=students.filter(s=>s.id!==id);
   
    
    
    try{
      fs.writeFileSync("students.json",JSON.stringify(students,null,2));
        if(students.length===initialLength){           
          res.status=404;
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify({message:"Student not found"}));
        }else{
          res.status=200;
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify({message: `Student with ID  ${id} deleted successfully"`}));
        }

      }catch(error){
        res.status=500;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({message:"Internal server error"}));
      }


  }
});
server.listen(port, hostname, () => {
  console.log(`API is running at http://${hostname}:${port}`);
});
