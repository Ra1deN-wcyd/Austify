<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Austify | Maintenance</title>
   
    <style>
        body {
            background-color: #0a0a0a;
            color: #ffffff;
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .container {
            text-align: center;
            border: 1px solid #333;
            padding: 3rem;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 1.5rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #00ff88; /* Cyber green */
            margin-bottom: 10px;
        }
        p {
            color: #888;
            font-size: 0.9rem;
        }
        .pulse {
            width: 10px;
            height: 10px;
            background: #00ff88;
            border-radius: 50%;
            display: inline-block;
            margin-right: 10px;
            animation: blink 1.5s infinite;
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="pulse"></span>The server is under maintainance</h1>
        <p>Austify is currently upgrading. Please check back soon.</p>
    </div>
</body>
</html>