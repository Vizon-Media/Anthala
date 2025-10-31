package main

import (
	"fmt"
	"net/http"

	"code.aware.ro/aware_soft/libaware/golang/email"
	"github.com/bmatei/libgo/server"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/julienschmidt/httprouter"
	"github.com/rs/zerolog/log"
)

type Config struct {
	From              string   `toml:"from" yaml:"from" env:"SERVICE_FROM" env-default:""`
	To                []string `toml:"to" yaml:"to" env:"SERVICE_TO" env-default:""`
	Host              string   `toml:"host" yaml:"host" env:"SERVICE_SMTP_HOST" env-default:""`
	Port              string   `toml:"port" yaml:"port" env:"SERVICE_SMTP_PORT" env-default:""`
	Password          string   `toml:"password" yaml:"password" env:"SERVICE_PASSWORD" env-default:""`
	RedirectToQuote   string   `toml:"redirect_quote" yaml:"redirect_quote" env:"SERVICE_REDIRECT_QUOTE" env-default:"/quote.html"`
	RedirectToMessage string   `toml:"redirect_message" yaml:"redirect_message" env:"SERVICE_REDIRECT_MESSAGE" env-default:"/contact.html"`
}

func NewConfig(path string) *Config {
	var cfg Config
	err := cleanenv.ReadConfig(path, &cfg)
	if err != nil {
		log.Error().Err(err).Str("path", path).Msg("Failed to read config")

		return nil
	}

	return &cfg
}

var sender email.Sender

func messageHandler(to []string, redirectTo string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		name := r.FormValue("name")
		email := r.FormValue("email")
		subjectText := r.FormValue("subject")
		messageText := r.FormValue("message")

		// w.Header().Set("Location", redirectTo)
		// w.WriteHeader(http.StatusFound)

		subject := fmt.Sprintf("New message from %s <%s>", name, email)

		message := fmt.Sprintf(`New message from %s <%s>:
			Subject: %s
			Message: %s
			`, name, email, subjectText, messageText,
		)

		err := sender.Send(subject, message, to)
		if err != nil {
			log.Error().Err(err).Str("subject", subject).Str("message", message).Msg("Failed to send")
		}
	}
}

func quoteHandler(to []string, redirectTo string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "Error parsing form data", http.StatusBadRequest)
			return
		}

		serviceType := r.FormValue("serviceType")
		projectType := r.FormValue("projectType")
		projectSize := r.FormValue("projectSize")
		timeline := r.FormValue("timeline")
		startDate := r.FormValue("startDate")
		name := r.FormValue("name")
		email := r.FormValue("email")
		phone := r.FormValue("phone")
		address := r.FormValue("address")
		messageText := r.FormValue("message")

		// w.Header().Set("Location", redirectTo)
		// w.WriteHeader(http.StatusFound)

		files := r.MultipartForm.File["files"]
		_ = files

		subject := fmt.Sprintf("New message from %s <%s>", name, email)

		message := fmt.Sprintf(`New message from %s <%s>:
			Service type: %s
			Project type: %s
			Project size: %s
			Timeline: %s
			Start date: %s
			Phone: %s
			Address: %s
			Message: %s
			`, name, email, serviceType, projectType,
			projectSize, timeline, startDate, phone,
			address, messageText,
		)

		err = sender.Send(subject, message, to)
		if err != nil {
			log.Error().Err(err).Str("subject", subject).Str("message", message).Msg("Failed to send")
		}
	}
}

func main() {
	cfg := server.NewConfig("http.toml")
	if cfg == nil {
		return
	}

	cfg2 := NewConfig("sample.toml")
	if cfg2 == nil {
		return
	}

	log.Info().Msg(fmt.Sprintf("%v", cfg))

	router := httprouter.New()

	sender = email.NewSMTPSender(cfg2.From, cfg2.Host, cfg2.Port, cfg2.Password)

	router.POST("/quote", quoteHandler(cfg2.To, cfg2.RedirectToQuote))
	router.POST("/mesaj", messageHandler(cfg2.To, cfg2.RedirectToMessage))

	server.RunServer(cfg, router)
}
