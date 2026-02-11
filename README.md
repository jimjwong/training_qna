# SUSS Gen AI Workshop - Pre-Session Survey

A beautiful web application for collecting pre-workshop survey responses with real-time dashboard for trainers.

## Features

### Participant View (`index.html`)
- Clean, modern interface with SUSS branding
- Three survey questions:
  1. What's your primary role?
  2. How familiar are you with AI?
  3. What's your biggest hope for this session?
- Smooth animations and user-friendly design
- Success confirmation after submission
- Mobile responsive

### Trainer Dashboard (`dashboard.html`)
- Real-time statistics overview
- Visual charts (doughnut charts) for each question
- Detailed percentage breakdowns
- Individual response listings
- Auto-refresh every 5 seconds
- Export to CSV functionality
- Clear data option
- Session timer

## How to Use

### For Participants
1. Open `index.html` in a web browser
2. Answer all three questions
3. Click "Submit Response"
4. Your response is recorded locally

### For Trainers
1. Open `dashboard.html` in a web browser
2. View real-time results as participants submit
3. Use the "Refresh" button to manually update
4. Export data to CSV for further analysis
5. Clear data when starting a new session

## Running the Application

### Option 1: Open Directly
Simply double-click `index.html` to open in your default browser. The dashboard can be accessed via the link at the bottom or by opening `dashboard.html`.

### Option 2: Using Python HTTP Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

### Option 3: Using Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```
Then open `http://localhost:8000` in your browser.

## Data Storage

- Data is stored locally in the browser's `localStorage`
- All participants on the same device share the same data store
- For multi-device deployment, consider implementing a backend API

## Deployment Options

### For Workshop Use

**Option A: Single Device**
- Run the application on the trainer's laptop
- Share the participant URL with attendees
- Participants access via local network or QR code

**Option B: Cloud Hosting (Recommended)**
Deploy to free hosting services:
1. **GitHub Pages**: Upload files to a GitHub repository and enable Pages
2. **Netlify**: Drag and drop the folder to Netlify
3. **Vercel**: Connect to your repository or upload directly

### Sharing with Participants
1. Deploy to a hosting service
2. Generate a short URL or QR code
3. Display the link/QR code at the workshop
4. Participants scan and submit responses

## Files Structure

```
t_qna/
├── index.html          # Participant survey page
├── dashboard.html      # Trainer dashboard
├── styles.css          # Styles for survey page
├── dashboard.css       # Styles for dashboard
├── script.js           # Survey functionality
├── dashboard.js        # Dashboard functionality
└── README.md           # This file
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors (in CSS files)
- SUSS Blue: `#003d7a`
- SUSS Orange: `#ff6b35`
- Light Blue: `#4a90e2`

### Questions
Edit the HTML files to modify questions and options.

## Technical Details

- **Frontend Only**: No backend required
- **Storage**: Browser localStorage API
- **Charts**: Chart.js library (CDN)
- **Responsive**: Mobile-friendly design
- **Real-time**: Auto-refresh every 5 seconds

## Troubleshooting

### Responses not appearing on dashboard
- Ensure both pages are open in the same browser
- Check if localStorage is enabled
- Try refreshing the dashboard

### Charts not displaying
- Check internet connection (Chart.js loads from CDN)
- Ensure JavaScript is enabled
- Try a different browser

## License

Created for SUSS Gen AI Workshop

## Support

For issues or questions, contact your workshop coordinator.
